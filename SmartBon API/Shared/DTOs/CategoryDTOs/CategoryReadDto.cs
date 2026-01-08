using Shared.Enums;
namespace Shared.DTOs.CategoryDTOs
{
    public class CategoryReadDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Icon { get; set; }

        public string ColorHex { get; set; }

        public List<SubcategoryReadDto>? Subcategories { get; set; }
    }
}
