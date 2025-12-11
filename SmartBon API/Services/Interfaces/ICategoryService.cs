using Shared.DTOs.CategoryDTOs;

namespace Services.Interfaces
{
    public interface ICategoryService
    {
        Task<CategoryReadDto> CreateCategory(CategoryCreateDto categoryCreateDto);
        Task<List<CategoryReadDto>> GetCategories();
        Task<CategoryReadDto> GetCategoryById(int id);
        Task<CategoryReadDto> DeleteCategory(int id);   
    }
}
