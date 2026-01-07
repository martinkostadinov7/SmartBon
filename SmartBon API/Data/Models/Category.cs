using Shared.Enums;
namespace Data.Models
{
    public class Category : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Icon { get; set; }

        public bool IsPredefined { get; set; }

        public int? UserId { get; set; }

        public User User { get; set; }

        public List<Subcategory> Subcategories { get; set; } = new List<Subcategory>();

        private Category() { }
        public Category(string name, string icon, bool isPredefined, int? userId)
        {
            Name = name;
            Icon = icon;
            IsPredefined = isPredefined;
            UserId = userId;
        }
    }
}
