namespace Data.Models
{
    /// <summary>
    /// Represents a primary grouping for expenses.
    /// </summary>
    public class Category : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Icon { get; set; }

        public string ColorHex { get; set; }

        /// <summary> 
        /// Indicates if the category is a global system default (true) or a custom category created by the user (false). 
        /// </summary>
        public bool IsPredefined { get; set; }

        public int? UserId { get; set; }

        public User User { get; set; }

        public List<Subcategory> Subcategories { get; set; } = new List<Subcategory>();

        private Category() { }
        public Category(string name, string icon, string colorHex, bool isPredefined, int? userId)
        {
            Name = name;
            Icon = icon;
            ColorHex = colorHex;
            IsPredefined = isPredefined;
            UserId = userId;
        }
    }
}