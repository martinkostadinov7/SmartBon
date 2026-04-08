namespace Data.Models
{
    /// <summary>
    /// Represents a secondary grouping for expenses, nested under a main Category.
    /// </summary>
    public class Subcategory : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Icon { get; set; }

        public string ColorHex { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        private Subcategory() { }
        public Subcategory(string name, string icon, string colorHex, int userId, int categoryId)
        {
            Name = name;
            Icon = icon;
            ColorHex = colorHex;
            UserId = userId;
            CategoryId = categoryId;
        }
    }
}