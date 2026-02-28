import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Persistent Types
  public type UserProfile = {
    name : Text;
  };

  public type ServiceCategory = {
    id : Nat;
    name : Text;
    description : Text;
  };

  public type SmmService = {
    id : Nat;
    categoryId : Nat;
    name : Text;
    description : Text;
    minQuantity : Nat;
    maxQuantity : Nat;
    pricePerUnit : Float;
  };

  public type OrderStatus = {
    #pending;
    #completed;
    #failed;
  };

  public type UserAccount = {
    owner : Principal;
    balance : Float;
  };

  public type ServiceOrder = {
    id : Nat;
    user : Principal;
    serviceId : Nat;
    link : Text;
    quantity : Nat;
    cost : Float;
    status : OrderStatus;
  };

  module ServiceOrder {
    public func compare(a : ServiceOrder, b : ServiceOrder) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Persistent State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let serviceCategories = Map.empty<Nat, ServiceCategory>();
  let smmServices = Map.empty<Nat, SmmService>();
  let userAccounts = Map.empty<Principal, UserAccount>();
  let serviceOrders = Map.empty<Nat, ServiceOrder>();

  var nextCategoryId = 1;
  var nextServiceId = 1;
  var nextOrderId = 1;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Initialize (Full SMM Catalog)
  public shared ({ caller }) func initialize() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized. Only admins can initialize the SMM store data.");
    };

    // Pre-populate Categories
    addCategory("Instagram", "Instagram-related services");
    addCategory("Telegram", "Telegram-related services");
    addCategory("YouTube", "YouTube-related services");
    addCategory("Facebook", "Facebook-related services");
    addCategory("Twitter/X", "Twitter/X-related services");
    addCategory("TikTok", "TikTok-related services");

    // Instagram Services (categoryId = 1)
    addService(1, "Instagram Followers [Real & Active]", "High-quality real followers, gradual delivery, no drop.", 100, 50000, 0.009);
    addService(1, "Instagram Likes", "Instant likes for posts and reels.", 50, 100000, 0.002);
    addService(1, "Instagram Views [Reels]", "Boost reel video view count.", 500, 500000, 0.001);
    addService(1, "Instagram Comments [Custom]", "Real user comments on posts.", 10, 5000, 0.05);
    addService(1, "Instagram Story Views", "Increase story view count.", 100, 100000, 0.001);
    addService(1, "Instagram Saves", "Post saves for reach boost.", 50, 50000, 0.003);

    // Telegram Services (categoryId = 2)
    addService(2, "Telegram Channel Members", "Real members added to public channels.", 100, 100000, 0.006);
    addService(2, "Telegram Group Members", "Boost your group member count.", 50, 50000, 0.007);
    addService(2, "Telegram Post Views", "Views on channel posts.", 100, 1000000, 0.0005);
    addService(2, "Telegram Reactions [👍]", "Thumbs-up reactions on posts.", 50, 50000, 0.003);
    addService(2, "Telegram Shares", "Increase post share count.", 20, 20000, 0.005);

    // YouTube Services (categoryId = 3)
    addService(3, "YouTube Views [High Retention]", "Watch-time boosting views, 60%+ retention.", 500, 1000000, 0.003);
    addService(3, "YouTube Subscribers", "Real-looking subscribers with avatars.", 50, 100000, 0.012);
    addService(3, "YouTube Likes", "Post likes on videos.", 100, 100000, 0.005);
    addService(3, "YouTube Comments [Custom]", "Custom comments from real-looking accounts.", 10, 5000, 0.08);
    addService(3, "YouTube Watch Hours", "Counted watch hours for monetization.", 10, 4000, 0.5);

    // Facebook Services (categoryId = 4)
    addService(4, "Facebook Page Likes", "Likes/follows on Facebook pages.", 100, 50000, 0.008);
    addService(4, "Facebook Post Likes", "Likes on specific posts.", 50, 50000, 0.003);
    addService(4, "Facebook Video Views", "Views on Facebook videos.", 500, 500000, 0.001);
    addService(4, "Facebook Group Members", "Add members to groups.", 100, 20000, 0.01);

    // Twitter/X Services (categoryId = 5)
    addService(5, "Twitter Followers", "Real-looking followers.", 100, 100000, 0.007);
    addService(5, "Twitter Likes", "Likes on tweets.", 50, 100000, 0.002);
    addService(5, "Twitter Retweets", "Retweet count boost.", 20, 50000, 0.004);
    addService(5, "Twitter Impressions", "Tweet impression booster.", 1000, 5000000, 0.0003);

    // TikTok Services (categoryId = 6)
    addService(6, "TikTok Followers", "Real followers for TikTok profiles.", 100, 100000, 0.008);
    addService(6, "TikTok Views", "Video view boost.", 500, 5000000, 0.0005);
    addService(6, "TikTok Likes", "Likes on TikTok videos.", 100, 500000, 0.002);
    addService(6, "TikTok Shares", "Share count booster.", 50, 50000, 0.005);
  };

  // Internal Helpers
  func addCategory(name : Text, description : Text) {
    let category = {
      id = nextCategoryId;
      name;
      description;
    };
    serviceCategories.add(nextCategoryId, category);
    nextCategoryId += 1;
  };

  func addService(categoryId : Nat, name : Text, description : Text, minQuantity : Nat, maxQuantity : Nat, pricePerUnit : Float) {
    let service = {
      id = nextServiceId;
      categoryId;
      name;
      description;
      minQuantity;
      maxQuantity;
      pricePerUnit;
    };
    smmServices.add(nextServiceId, service);
    nextServiceId += 1;
  };

  // Service Category Functions - public catalog, no auth required
  public query func getCategories() : async [ServiceCategory] {
    serviceCategories.values().toArray();
  };

  public query func getServicesByCategory(categoryId : Nat) : async [SmmService] {
    smmServices.filter(
      func(_id, service) {
        service.categoryId == categoryId;
      }
    ).values().toArray();
  };

  // Account Management - requires authenticated user role
  public shared ({ caller }) func createAccount() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create an account");
    };
    let account = {
      owner = caller;
      balance = 0.0;
    };
    userAccounts.add(caller, account);
  };

  public query ({ caller }) func getBalance() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check their balance");
    };
    switch (userAccounts.get(caller)) {
      case (null) { 0.0 };
      case (?account) { account.balance };
    };
  };

  public shared ({ caller }) func deposit(amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can deposit funds");
    };
    switch (userAccounts.get(caller)) {
      case (null) {
        let newAccount = {
          owner = caller;
          balance = amount;
        };
        userAccounts.add(caller, newAccount);
      };
      case (?account) {
        let updatedAccount = {
          owner = account.owner;
          balance = account.balance + amount;
        };
        userAccounts.add(caller, updatedAccount);
      };
    };
  };

  // Order Processing - requires authenticated user role
  public shared ({ caller }) func placeOrder(serviceId : Nat, link : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };

    let account = switch (userAccounts.get(caller)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) { account };
    };

    let service = switch (smmServices.get(serviceId)) {
      case (null) { Runtime.trap("Service not found") };
      case (?service) { service };
    };

    if (quantity < service.minQuantity or quantity > service.maxQuantity) {
      Runtime.trap("Quantity must be between " # service.minQuantity.toText() # " and " # service.maxQuantity.toText());
    };

    let cost = service.pricePerUnit * quantity.toFloat();

    if (account.balance < cost) {
      Runtime.trap("Insufficient funds. Please deposit more ICP to place this order");
    };

    let updatedAccount = {
      owner = account.owner;
      balance = account.balance - cost;
    };
    userAccounts.add(caller, updatedAccount);

    let order = {
      id = nextOrderId;
      user = caller;
      serviceId;
      link;
      quantity;
      cost;
      status = #pending;
    };

    serviceOrders.add(nextOrderId, order);
    nextOrderId += 1;
  };

  public query ({ caller }) func getMyOrders() : async [ServiceOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their orders");
    };
    let ordersArray = serviceOrders.values().toArray();
    ordersArray.filter(func(order) { order.user == caller }).sort();
  };
};
