namespace Data.Models
{
    /// <summary>
    /// Base interface for all database entities, ensuring a standardized primary key.
    /// </summary>
    public interface IEntity
    {
        int Id { get; set; }
    }
}