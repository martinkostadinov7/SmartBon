using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.DTOs.CategoryDTOs;
namespace Services.Categories
{
    public class CategoryService(IUserAccessor user, ICategoryRepository categoryRepository, IMapper mapper) : ICategoryService
    {
        public async Task<CategoryReadDto> CreateCategoryAsync(CategoryCreateDto categoryCreateDto)
        {
            Category category = mapper.Map<Category>(categoryCreateDto);
            category.UserId = user.Id;
            await categoryRepository.AddAsync(category);

            return mapper.Map<CategoryReadDto>(category);
        }

        public async Task<List<CategoryReadDto>> GetCategoriesAsync()
        {
            List<Category> categoriesFromDb = await categoryRepository.GetAll(user.Id); //todo customised apiexeptons 

            return mapper.Map<List<CategoryReadDto>>(categoriesFromDb);
        }

        public async Task<CategoryReadDto> GetCategoryByIdAsync(int id)
        {
            Category categoryFromDb = await categoryRepository.GetByIdAsync(id, [x => x.Subcategories]) ?? throw new Exception("Not found"); //todo customised apiexeptons 
            if (user.Id != categoryFromDb.UserId)
            {
                throw new Exception("User does not have permission to vview this content!");
            }
            return mapper.Map<CategoryReadDto>(categoryFromDb);
        }

        public async Task<CategoryReadDto> DeleteCategoryAsync(int id)
        {
            Category categoryFromDb = await categoryRepository.GetByIdAsync(id) ?? throw new Exception("Not found");
            if (categoryFromDb.IsPredefined)
            {
                throw new Exception("Cannot delete predefined categories!");
            }
            if (user.Id != categoryFromDb.UserId)
            {
                throw new Exception("User does not have permission to vview this content!");
            }
            await categoryRepository.DeleteAsync(categoryFromDb);

            return mapper.Map<CategoryReadDto>(categoryFromDb);
        }
    }
}
