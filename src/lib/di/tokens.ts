export const TOKENS = {
  // Services
  AuthService: Symbol.for("AuthService"),
  UserService: Symbol.for("UserService"),
  RestaurantService: Symbol.for("RestaurantService"),
  MemberService: Symbol.for("MemberService"),
  BranchService: Symbol.for("BranchService"),
  ProductService: Symbol.for("ProductService"),
  CustomerAddressService: Symbol.for("CustomerAddressService"),
  PermissionCacheService: Symbol.for("PermissionCacheService"),

  // Controllers
  AuthController: Symbol.for("AuthController"),
  UserController: Symbol.for("UserController"),
  RestaurantController: Symbol.for("RestaurantController"),
  MemberController: Symbol.for("MemberController"),
  BranchController: Symbol.for("BranchController"),
  ProductController: Symbol.for("ProductController"),
  CustomerAddressController: Symbol.for("CustomerAddressController"),

  // Lib/infra
  Logger: Symbol.for("Logger"),
  CacheProvider: Symbol.for("CacheProvider"),
};
