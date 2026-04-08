using Shared.DTOs.Categories;

namespace Services.Interfaces
{
    /// <summary>
    /// Service for managing nested subcategories within main categories.
    /// </summary>
    public interface ISubcategoryService
    {
        /// <summary> Creates a new subcategory under a specific parent category. </summary>
        Task<SubcategoryReadDto> CreateSubcategoryAsync(int categoryId, SubcategoryCreateDto SubcategoryCreateDto);

        /// <summary> Retrieves all subcategories belonging to a specific parent category. </summary>
        Task<List<SubcategoryReadDto>> GetSubcategoriesAsync(int categoryId);

        /// <summary> Retrieves a specific subcategory by its ID, ensuring it belongs to the specified parent category. </summary>
        Task<SubcategoryReadDto> GetSubcategoryByIdAsync(int categoryId, int id);

        /// <summary> Deletes a specific subcategory. </summary>
        Task<SubcategoryReadDto> DeleteSubcategoryAsync(int id);
    }
}