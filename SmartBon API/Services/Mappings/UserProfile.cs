using AutoMapper;
using Data.Models;
using Shared.DTOs.Users;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserLoginDto>();
        CreateMap<UserRegisterDto, User>();
        CreateMap<User, UserInfoDto>();
    }
}
