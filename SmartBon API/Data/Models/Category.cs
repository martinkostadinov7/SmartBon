using Shared.Enums;
namespace Data.Models
{
    public class Category : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public IconType IconType { get; set; }

        public string IconValue { get; set; }

        public bool IsPredefined { get; set; }

        public int? UserId { get; set; }

        public User User { get; set; }

        public List<Subcategory> Subcategories { get; set; } = new List<Subcategory>();

        private Category() { }
        public Category(string name, IconType iconType, string iconValue, bool isPredefined, int? userId)
        {
            Name = name;
            IconType = iconType;
            IconValue = iconValue;
            IsPredefined = isPredefined;
            UserId = userId;
        }
    }
}
