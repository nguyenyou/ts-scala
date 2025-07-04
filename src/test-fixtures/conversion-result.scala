trait Person:
  val name: String
  val age: Int
  val email: Option[String]

type UserId = String

trait User extends Person:
  val id: UserId
  val roles: List[String]