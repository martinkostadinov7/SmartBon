using AutoMapper;
using Data.Models;
using Shared.DTOs.CategoryDTOs;

public class CategoryProfile : Profile
{
    public CategoryProfile()
    {
        // Example mappings
        CreateMap<Category, CategoryReadDto>();
        CreateMap<CategoryCreateDto, Category>();

        CreateMap<Subcategory, SubcategoryReadDto>();
        CreateMap<SubcategoryCreateDto, Subcategory>();
    }
}
