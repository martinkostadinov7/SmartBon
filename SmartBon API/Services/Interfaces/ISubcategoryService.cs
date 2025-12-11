using Shared.DTOs.CategoryDTOs;

namespace Services.Interfaces
{
    public interface ISubcategoryService
    {
        Task<SubcategoryReadDto> CreateSubcategory(int categoryId, SubcategoryCreateDto SubcategoryCreateDto);
        Task<List<SubcategoryReadDto>> GetSubcategories(int categoryId);
        Task<SubcategoryReadDto> GetSubcategoryById(int categoryId, int id);
        Task<SubcategoryReadDto> DeleteSubcategory(int id);
    }
}
