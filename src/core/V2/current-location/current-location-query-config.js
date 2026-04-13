const currentLocationQueryConfig = {
  searchableFields: ["user.name"], 
  filterableFields: ["user_id"],
  orderableFields: ["created_at"],
  relations: {
    user: true,
  },
  dateFields: {
    created_at: "created_at",
    updated_at: "updated_at",
  },
  select: {
    user: {
      id: true,
      name: true,
    },
  },
};

export default currentLocationQueryConfig;
