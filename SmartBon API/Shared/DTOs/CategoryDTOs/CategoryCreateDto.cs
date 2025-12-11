using Shared.Enums;
namespace Shared.DTOs.CategoryDTOs
{
    public class CategoryCreateDto
    {
        public string Name { get; set; }

        public IconType IconType { get; set; }

        public string IconValue { get; set; }
    }
}
