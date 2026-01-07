    using Shared.Enums;
    namespace Data.Models
    {
        public class Subcategory : IEntity
        {
            public int Id { get; set; }

            public string Name { get; set; }

            public string Icon { get; set; }

            public int CategoryId { get; set; }

            public Category Category { get; set; }

            public int UserId { get; set; }
            public User User { get; set; }

            private Subcategory() { }
            public Subcategory(string name, string icon, int userId, int categoryId)
            {
                Name = name;
                Icon = icon;
                UserId = userId;
                CategoryId = categoryId;
            }
        }
    }
