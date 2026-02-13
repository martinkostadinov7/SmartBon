using AutoMapper;
using Data.Models;
using Shared.DTOs.UserDTOs;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserLoginDto>();
        CreateMap<UserRegisterDto, User>();
        CreateMap<User, UserInfoDto>();
    }
}
