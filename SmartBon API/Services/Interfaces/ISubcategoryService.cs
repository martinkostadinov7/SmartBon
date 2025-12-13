using Shared.DTOs.CategoryDTOs;

namespace Services.Interfaces
{
    public interface ISubcategoryService
    {
        Task<SubcategoryReadDto> CreateSubcategoryAsync(int categoryId, SubcategoryCreateDto SubcategoryCreateDto);
        Task<List<SubcategoryReadDto>> GetSubcategoriesAsync(int categoryId);
        Task<SubcategoryReadDto> GetSubcategoryByIdAsync(int categoryId, int id);
        Task<SubcategoryReadDto> DeleteSubcategoryAsync(int id);
    }
}
