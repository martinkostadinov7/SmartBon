namespace Data.Models
{
    public class Category : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Icon { get; set; }

        public string ColorHex { get; set; }

        public bool IsPredefined { get; set; }

        public int? UserId { get; set; }

        public User User { get; set; }

        public List<Subcategory> Subcategories { get; set; } = new List<Subcategory>();

        private Category() { }
        public Category(string name, string icon,string colorHex ,bool isPredefined, int? userId)
        {
            Name = name;
            Icon = icon;
            ColorHex = colorHex;
            IsPredefined = isPredefined;
            UserId = userId;
        }
    }
}
