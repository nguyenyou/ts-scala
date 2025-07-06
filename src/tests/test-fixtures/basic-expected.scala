trait Person {
  val name: String
  val age: Double
}

trait AnotherPerson {
  val name: String
  val age: Double
}

type Color = "red" | "green" | "blue"

type Age = Double | String

trait ButtonProps {
  val label: String
  val color: Color
}