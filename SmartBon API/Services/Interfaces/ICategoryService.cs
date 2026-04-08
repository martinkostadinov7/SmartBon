using Shared.DTOs.Categories;

namespace Services.Interfaces
{
    /// <summary>
    /// Service for managing expense categories.
    /// </summary>
    public interface ICategoryService
    {
        /// <summary> Creates a new custom category. </summary>
        Task<CategoryReadDto> CreateCategoryAsync(CategoryCreateDto categoryCreateDto);

        /// <summary> Retrieves all categories available to the current user (system and custom). </summary>
        Task<List<CategoryReadDto>> GetCategoriesAsync();

        /// <summary> Retrieves a specific category by its ID. </summary>
        Task<CategoryReadDto> GetCategoryByIdAsync(int id);

        /// <summary> Deletes a specific custom category. </summary>
        Task<CategoryReadDto> DeleteCategoryAsync(int id);
    }
}