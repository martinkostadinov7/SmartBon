using AutoMapper;
using Data.Models;
using Shared.DTOs.UserDTOs;

public class UserProfile : Profile
{
    public UserProfile()
    {
        // Example mappings
        CreateMap<User, UserLoginDto>();
        CreateMap<UserRegisterDto, User>();
        
        CreateMap<User, UserInfoDto>();
    }
}
