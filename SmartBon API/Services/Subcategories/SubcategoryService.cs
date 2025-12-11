using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.DTOs.CategoryDTOs;

namespace Services.Subcategories
{
    public class SubcategoryService(IUserAccessor user, ISubcategoryRepository subcategoryRepository, IMapper mapper, ICategoryRepository categoryRepository) : ISubcategoryService
    {
        public async Task<SubcategoryReadDto> CreateSubcategory(int categoryId, SubcategoryCreateDto subcategoryCreateDto)
        {
            Subcategory subcategory = mapper.Map<Subcategory>(subcategoryCreateDto);
            subcategory.CategoryId = categoryId;
            subcategory.UserId = user.Id;
            await subcategoryRepository.Add(subcategory);

            return mapper.Map<SubcategoryReadDto>(subcategory);
        }

        public async Task<List<SubcategoryReadDto>> GetSubcategories(int categoryId)
        {
            List<Subcategory> subcategoriesFromDb = await subcategoryRepository.GetAll(user.Id, categoryId);

            return mapper.Map<List<SubcategoryReadDto>>(subcategoriesFromDb);
        }

        public async Task<SubcategoryReadDto> GetSubcategoryById(int categoryId, int id)
        {
            Category category = await categoryRepository.GetById(categoryId, [x => x.Subcategories]) ?? throw new Exception("Category Not found"); //todo customised apiexeptons ;
            Subcategory subcategoryFromDb = category.Subcategories.SingleOrDefault(s => s.Id == id) ?? throw new Exception("subcategory Not found"); //todo customised apiexeptons ; //todo customised apiexeptons 
            if (user.Id != subcategoryFromDb.UserId)
            {
                throw new Exception("User has no access to this content!");
            }
            return mapper.Map<SubcategoryReadDto>(subcategoryFromDb);
        }

        public async Task<SubcategoryReadDto> DeleteSubcategory(int id)
        {
            Subcategory? subcategoryFromDb = await subcategoryRepository.GetById(id) ?? throw new Exception("Not found");
            if (user.Id != subcategoryFromDb.UserId)
            {
                throw new Exception("User has no access to this content!");
            }
            await subcategoryRepository.Delete(subcategoryFromDb);

            return mapper.Map<SubcategoryReadDto>(subcategoryFromDb);
        }
    }
}
