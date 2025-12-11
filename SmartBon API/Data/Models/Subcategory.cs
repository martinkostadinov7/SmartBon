    using Shared.Enums;
    namespace Data.Models
    {
        public class Subcategory : IEntity
        {
            public int Id { get; set; }

            public string Name { get; set; }

            public IconType IconType { get; set; }

            public string IconValue { get; set; }

            public int CategoryId { get; set; }

            public Category Category { get; set; }

            public int UserId { get; set; }
            public User User { get; set; }

            private Subcategory() { }
            public Subcategory(string name, IconType iconType, string iconValue, int userId, int categoryId)
            {
                Name = name;
                IconType = iconType;
                IconValue = iconValue;
                UserId = userId;
                CategoryId = categoryId;
            }
        }
    }
