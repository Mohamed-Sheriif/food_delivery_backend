import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Insert predefined roles (only 3 roles as requested)
  await knex.raw(`
    INSERT INTO roles (name, display_name, description) VALUES
    ('owner', 'Restaurant Owner', 'Full access to all restaurant resources'),
    ('branch_manager', 'Branch Manager', 'Manages branch operations and staff'),
    ('staff', 'Staff Member', 'Limited access for daily operations')
    ON CONFLICT (name) DO NOTHING;
  `);

  // Insert permissions with AWS-like resource naming
  await knex.raw(`
    INSERT INTO permissions (resource, action) VALUES
    -- Product permissions
    ('core:product', 'create'),
    ('core:product', 'read'),
    ('core:product', 'update'),

    -- Member permissions
    ('core:member', 'create'),
    ('core:member', 'read'),
    ('core:member', 'update'),
    ('core:member', 'delete'),

    -- Branch permissions
    ('core:branch', 'create'),
    ('core:branch', 'update'),

    -- Restaurant settings permissions
    ('core:restaurant', 'update')

    ON CONFLICT (resource, action) DO NOTHING;
  `);

  // Owner gets ALL permissions
  await knex.raw(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r, permissions p
    WHERE r.name = 'owner'
    ON CONFLICT DO NOTHING;
  `);

  // Branch Manager permissions - product CRUD, member read, branch update
  await knex.raw(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r, permissions p
    WHERE r.name = 'branch_manager'
    AND p.resource || ':' || p.action IN (
        'core:product:create',
        'core:product:read',
        'core:product:update',
        'core:member:read',
        'core:branch:update'
    )
    ON CONFLICT DO NOTHING;
  `);

  // Staff permissions - read only
  await knex.raw(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r, permissions p
    WHERE r.name = 'staff'
    AND p.resource || ':' || p.action IN (
        'core:product:read',
        'core:member:read'
    )
    ON CONFLICT DO NOTHING;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DELETE FROM role_permissions;
    DELETE FROM permissions;
    DELETE FROM roles WHERE name IN ('owner', 'branch_manager', 'staff');
`);
}
