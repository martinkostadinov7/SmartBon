using Shared.DTOs.Categories;

namespace Services.Interfaces
{
    public interface ICategoryService
    {
        Task<CategoryReadDto> CreateCategoryAsync(CategoryCreateDto categoryCreateDto);
        Task<List<CategoryReadDto>> GetCategoriesAsync();
        Task<CategoryReadDto> GetCategoryByIdAsync(int id);
        Task<CategoryReadDto> DeleteCategoryAsync(int id);   
    }
}
