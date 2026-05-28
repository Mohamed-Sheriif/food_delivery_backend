# Homework Video 5 — RBAC Module: Endpoints, Middlewares & Owner Member

This guide walks through completing the RBAC module: adding the missing endpoints, implementing authorization middlewares, wiring them into all routes, and fixing user registration to insert the owner member with proper JWT payload.

---

## Overview

By the end of this homework you will have:
1. **5 new RBAC endpoints** (list members, update member, delete member, update member branches, get role permissions)
2. A working **`requireBranchAccess`** middleware
3. **Permission middlewares** (`rbac`, `requireRestaurantMember`, `requireBranchAccess`) added to all protected routes
4. **Owner member insertion** during restaurant registration, with restaurant info in the JWT
5. A bug fix in the `rbac` middleware (system admin bypass logic was inverted)
6. **Proper layering** — centralize user creation in `UserService`, member creation through `MemberService`, so no service bypasses another service's repository

---

## Step 1 — Add New Error Constants

**File:** `src/app/rbac/errors.ts`

Add two new errors:

```ts
export const MemberNotFoundError = new AppError('Member not found', 404);
export const CannotDeleteOwnerError = new AppError('Cannot delete the restaurant owner', 400);
```

These will be used by the new service methods.

---

## Step 2 — Add New DTOs

**File:** `src/app/rbac/dto/member.dto.ts`

Add two new DTOs below `CreateMemberDTO`:

- **`UpdateMemberDTO`** — optional `role` (string) and optional `status` (string, must be one of `active`, `inactive`, `suspended`). Use `@IsIn` for status validation.
- **`UpdateMemberBranchesDTO`** — required `branchIds` (array of numbers). Use `@IsArray`.

---

## Step 3 — Add Repository Functions

### 3a. `src/app/rbac/repository/restaurant_member.repo.ts`

Add these 4 functions:

- **`findMembersByRestaurantId(restaurantId)`** — joins `restaurant_members`, `users`, and `roles` to return member list with `id`, `userId`, `email`, `name`, `phone`, `role`, `roleDisplayName`, `status`
- **`findMemberWithRoleName(memberId)`** — joins `restaurant_members` + `roles` in **one query**, returns `{member, roleName}` or null. This avoids N+1 — instead of calling `findMemberById` + `findRoleByName('owner')` separately, we get both in a single query.
- **`updateMember(memberId, data)`** — updates `role_id` and/or `status` + `updated_at`
- **`deleteMember(memberId)`** — deletes from `member_branches` first (FK), then from `restaurant_members`

### 3b. `src/app/rbac/repository/permission.repo.ts`

Add one function:

- **`getPermissionsDetailsByRoleName(roleName)`** — joins `permissions`, `role_permissions`, `roles`. Returns `{permission: string}[]` where permission is `resource:action` format (e.g. `core:product:create`)

### 3c. `src/app/rbac/repository/member-branch.repo.ts`

Add one function:

- **`countBranchesByIdsAndRestaurant(branchIds, restaurantId)`** — single `COUNT` query on `restaurant_branches` with `whereIn('id', branchIds).andWhere('restaurant_id', restaurantId)`. Returns a number. Used to validate that all provided branch IDs actually belong to the restaurant.

---

## Step 4 — Add Service Methods

**File:** `src/app/rbac/service/member.service.ts`

Add 5 new methods to `MemberService`:

### `listMembers(restaurantId)`
- Calls `findMembersByRestaurantId`
- Returns `{data: members}`

### `updateMember(restaurantId, memberId, data)`
- Use `findMemberWithRoleName(memberId)` — **one query** instead of two, gets member + role name together
- Verify member belongs to restaurant (use `Number()` for comparison since DB returns bigint as string)
- If `data.role` is provided, look up the roleId with `findRoleByName`
- Call `updateMember` from repo

### `deleteMember(restaurantId, memberId)`
- Use `findMemberWithRoleName(memberId)` — **one query**, no N+1
- Verify restaurant ownership
- Check `roleName === 'owner'` — throw `CannotDeleteOwnerError` if so (no separate `findRoleByName` call needed)
- Call `deleteMember` from repo

### `updateMemberBranches(restaurantId, memberId, data)`
- Use `findMemberWithRoleName(memberId)` — **one query**, no N+1
- Verify restaurant ownership
- Check `roleName === 'owner'` — owners have access to all branches, reject
- **Validate branch ownership:** call `countBranchesByIdsAndRestaurant(branchIds, restaurantId)` — if count !== branchIds.length, throw error (some branches don't belong to this restaurant)
- Build `MemberBranch` entities from `data.branchIds`
- Call `setMemberBranches` (which deletes old + inserts new)

### `getRolePermissions(roleName)`
- Calls `getPermissionsDetailsByRoleName`
- Returns `{role, permissions}`

Also update **`createMember`** to:
- Handle optional `branchIds` (default to `[]`)
- **Validate branch ownership** before the transaction: call `validateBranchOwnership(branchIds, restaurantId)` — same COUNT-based check
- Return a proper response object with `message` and `member` data

### Avoiding N+1 queries

A common mistake: when you need the member AND their role name, don't do:
```ts
const member = await findMemberById(id);       // query 1
const roleId = await findRoleByName('owner');   // query 2
if (member.roleId === roleId) { ... }
```
Instead, use a single JOIN:
```ts
const result = await findMemberWithRoleName(id);  // 1 query with JOIN
if (result.roleName === 'owner') { ... }
```

Similarly, to validate branchIds, don't loop and check each one:
```ts
// BAD: N queries
for (const id of branchIds) {
    const branch = await findBranchById(id);  // N+1!
}
// GOOD: 1 query
const count = await countBranchesByIdsAndRestaurant(branchIds, restaurantId);
if (count !== branchIds.length) throw error;
```

**Important:** Use `Number()` when comparing IDs from the database (PostgreSQL bigint comes back as strings).

---

## Step 5 — Add Controller Methods

**File:** `src/app/rbac/controller/member.controller.ts`

Add 5 new methods matching the service:

- `listMembers` — calls `memberService.listMembers`, responds 200
- `updateMember` — validates `UpdateMemberDTO`, calls service with `restaurantId` and `memberId` from params
- `deleteMember` — calls service with params
- `updateMemberBranches` — validates `UpdateMemberBranchesDTO`, calls service
- `getRolePermissions` — reads `req.params.role`, calls service

All follow the same pattern: try/catch with `next(error)`.

---

## Step 6 — Add Routes

**File:** `src/app/rbac/routes.ts`

Wire up all 6 routes (1 existing + 5 new):

```
GET    /roles/:role/permissions                              — public (no auth)
POST   /restaurants/:restaurantId/members                    — authenticate + requireRestaurantMember + rbac(core:member, create)
GET    /restaurants/:restaurantId/members                    — authenticate + requireRestaurantMember + rbac(core:member, read)
PATCH  /restaurants/:restaurantId/members/:memberId          — authenticate + requireRestaurantMember + rbac(core:member, update)
DELETE /restaurants/:restaurantId/members/:memberId          — authenticate + requireRestaurantMember + rbac(core:member, delete)
PUT    /restaurants/:restaurantId/members/:memberId/branches — authenticate + requireRestaurantMember + rbac(core:member, update)
```

Each protected route uses **3 middlewares** in order:
1. `authenticate` — verify JWT
2. `requireRestaurantMember('restaurantId')` — verify user belongs to this restaurant
3. `rbac({resource, action})` — verify user's role has the required permission

---

## Step 7 — Implement `requireBranchAccess` Middleware

**File:** `src/common/auth/rbac.ts`

Replace the placeholder `requireBranchAccess` with a real implementation: 

**Logic:**
- System admins and owners bypass
- Extract branchId from params or query string
- Check if the branch is in the user's `branchIds` (set during login from `member_branches` table)

### Bug fix in `rbac` middleware

The system admin bypass had an inverted condition. Change:
```ts
if (!allowSystemAdmin && req.user.role == SystemRole.SYSTEM_ADMIN)
```
to:
```ts
if (allowSystemAdmin && req.user.role == SystemRole.SYSTEM_ADMIN)
```

### Bug fix in `requireRestaurantMember`

The original code didn't `return` before calling `next()` for system admins, causing the response to continue. Also restructure so system admin check comes first:

```ts
if (req.user?.role == SystemRole.SYSTEM_ADMIN) return next();
if (Number(req.user?.restaurantId) !== Number(restaurantId)) {
    return res.status(403).json({ error: "Permission denied" });
}
next();
```

---

## Step 8 — Add Middlewares to All Routes

### Restaurant Routes (`src/app/restaurant/routes.ts`)

- `PATCH /:id` — add `requireRestaurantMember('id')` + `rbac({resource:"core:restaurant", action:"update"})`
- `PATCH /:id/status` and `POST /` — system_admin only (already checked in service, no rbac needed)

### Branch Routes (`src/app/branch/routes.ts`)

- `POST /restaurants/:restaurantId/branches` — add `requireRestaurantMember('restaurantId')` + `rbac({resource:"core:branch", action:"create"})`
- `PATCH /branches/:id` — add `requireBranchAccess('id')` + `rbac({resource:"core:branch", action:"update"})`
- `PATCH /branches/:id/status` — system_admin only (checked in service)

### Product Routes (`src/app/product/routes.ts`)

- `GET /restaurants/:restaurantId/products` — add `requireRestaurantMember('restaurantId')` + `rbac({resource:"core:product", action:"read"})`
- `POST /restaurants/:restaurantId/products` — add `requireRestaurantMember('restaurantId')` + `rbac({resource:"core:product", action:"create"})`
- `PATCH /products/:id` — add `requireBranchAccess('branchId')` + `rbac({resource:"core:product", action:"update"})`

Public endpoints (GET by branch, GET by id, GET categories) stay without auth.

---

## Step 9 — Proper Layering: Centralize User & Member Creation

Before adding the owner member logic, we need to fix the architecture. Currently, multiple services bypass the owning service and call repositories directly.

The rule: **Service A should call Service B's service, not Service B's repository.**

### 9a. Add `create` to `UserService`

**File:** `src/app/user/service/user.service.ts`

Add a `create` method that centralizes all user creation:
- Takes `{email, phone, name, password, systemRole}` + optional transaction
- Checks if user exists (`findUserExistsByEmailOrPhone`)
- Hashes password (empty string stays empty — for invited members who set password later)
- Calls `createUser` from the user repo
- Returns the created `User`

Define a `CreateUserData` interface for the method input.

### 9b. Add `createOwnerMember` to `MemberService`

**File:** `src/app/rbac/service/member.service.ts`

Add a method that creates an owner member record:
- Takes `restaurantId`, `userId`, and optional transaction
- Looks up the owner role by name
- Inserts the `restaurant_members` row with status `active`

Inject `UserService` into `MemberService` via constructor. Update `createMember` to call `this.userService.create()` instead of calling the repo directly.

### 9c. Refactor `auth.service.ts`

**File:** `src/app/auth/service/auth.service.ts`

- Inject `UserService` and `MemberService` via constructor (alongside `RestaurantService`)
- In `register`: replace `createUser(...)` repo call with `this.userService.create(...)`
- In `register`: replace the direct `createRestaurantMember(...)` repo call with `this.memberService.createOwnerMember(restaurant.id, user.id, trx)`
- Build `restaurantMemberInfo` and spread it into the JWT payload
- Declare `restaurantMemberInfo` **outside** the try block so it's accessible after commit

### 9d. Refactor `restaurant.service.ts`

**File:** `src/app/restaurant/service/restaurant.service.ts`

- Inject `UserService` via constructor
- In `createWithOwner`: replace `createUser(...)` repo call with `this.userService.create(...)`
- In `createWithOwner`: add `memberService.createOwnerMember(restaurant.id, user.id, trx)` — this was missing entirely (pre-existing bug: owners created via `POST /restaurants` had no member record, so login would fail for them)

### Why this matters

**Before the fix:**
```
auth.service    → users.repo.createUser()             ← violation
                → restaurant_member.repo.create()     ← violation
member.service  → users.repo.createUser()             ← violation
restaurant.service → users.repo.createUser()          ← violation
                   → (no member created at all)       ← bug
```

**After the fix:**
```
auth.service       → userService.create()             ← correct
                   → memberService.createOwnerMember() ← correct
member.service     → userService.create()             ← correct
restaurant.service → userService.create()             ← correct
                   → memberService.createOwnerMember() ← correct
```

User creation logic (duplicate check, password hashing, timestamps) now lives in exactly one place. If you need to add a validation or field, you change it once.

---

## Step 10 — Verify Everything Works

### Test flow:

1. **Register** a restaurant user — verify JWT contains `restaurantId`, `restaurantRole: "owner"`, `branchIds: []`
2. **List members** — should show the owner as the only member
3. **Create a branch** for the restaurant
4. **Invite a staff member** with branchIds — check console for OTP
5. **Accept invite** and **login** as staff
6. **Test permissions** — staff should be DENIED creating products (403)
7. **Test permissions** — staff CAN read members (200)
8. **Get role permissions** — public endpoint, try for `owner`, `staff`, `branch_manager`
9. **Update member**, **delete member**, **update branches** using owner cookies
10. **Test branch validation** — try inviting a member or updating branches with branchIds that don't belong to the restaurant (should get 400)
11. **Test cross-restaurant access** — staff should not be able to access another restaurant's members (403)

---

## Summary of Changes by File

| File | What Changed |
|------|-------------|
| `src/app/rbac/errors.ts` | Added `MemberNotFoundError`, `CannotDeleteOwnerError` |
| `src/app/rbac/dto/member.dto.ts` | Added `UpdateMemberDTO`, `UpdateMemberBranchesDTO` |
| `src/app/rbac/repository/restaurant_member.repo.ts` | Added `findMembersByRestaurantId`, `findMemberWithRoleName` (JOIN, no N+1), `updateMember`, `deleteMember` |
| `src/app/rbac/repository/member-branch.repo.ts` | Added `countBranchesByIdsAndRestaurant` (branch ownership validation) |
| `src/app/rbac/repository/permission.repo.ts` | Added `getPermissionsDetailsByRoleName` |
| `src/app/rbac/service/member.service.ts` | Added `createOwnerMember`, `listMembers`, `updateMember`, `deleteMember`, `updateMemberBranches`, `getRolePermissions`; refactored `createMember` to use `userService.create()` |
| `src/app/user/service/user.service.ts` | Added `create` method — single place for all user creation (duplicate check + password hash + insert) |
| `src/app/rbac/controller/member.controller.ts` | Added `listMembers`, `updateMember`, `deleteMember`, `updateMemberBranches`, `getRolePermissions` |
| `src/app/rbac/routes.ts` | Added 5 new routes + GET role permissions |
| `src/common/auth/rbac.ts` | Fixed `rbac` system admin bug, fixed `requireRestaurantMember` flow, implemented `requireBranchAccess` |
| `src/app/restaurant/service/restaurant.service.ts` | Refactored to use `userService.create()` and `memberService.createOwnerMember()`, fixed missing owner member creation |
| `src/app/restaurant/routes.ts` | Added `requireRestaurantMember` + `rbac` to PATCH |
| `src/app/branch/routes.ts` | Added `requireRestaurantMember` + `rbac` to POST, `requireBranchAccess` + `rbac` to PATCH |
| `src/app/product/routes.ts` | Added `requireRestaurantMember` + `rbac` to GET/POST, `requireBranchAccess` + `rbac` to PATCH |
| `src/app/auth/service/auth.service.ts` | Refactored to use `userService.create()` and `memberService.createOwnerMember()`; include restaurant info in JWT |

---

## How the Layers Connect

```
Route (express router)
  -> authenticate (verify JWT, set req.user)
  -> requireRestaurantMember (verify user belongs to restaurant)
  -> requireBranchAccess (verify user has access to branch)
  -> rbac (verify user's role has the required permission)
  -> Controller (validates DTO, extracts params)
    -> Service (business logic, orchestrates repos)
      -> Repository (DB queries via knex)
```

The middleware stack runs left to right. If any middleware rejects, the request never reaches the controller.
