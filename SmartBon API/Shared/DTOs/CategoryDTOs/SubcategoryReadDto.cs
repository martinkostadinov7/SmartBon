using Shared.Enums;
namespace Shared.DTOs.CategoryDTOs
{
    public class SubcategoryReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public IconType IconType { get; set; }

        public string IconValue { get; set; }
    }
}
