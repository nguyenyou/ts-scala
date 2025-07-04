
//> using scala 3.7.1
//> using platform scala-js

//> using dep "org.scala-js::scalajs-dom::2.8.0"
//> using dep "com.raquo::laminar::17.2.1"

//> using jsModuleKind es
//> using jsModuleSplitStyleStr fewestmodules

import scala.scalajs.js

trait Person:
  val name: String
  val age: Int
  val email: Option[String]

type UserId = String

trait User extends Person:
  val id: UserId
  val roles: List[String]

@main def run(): Unit = println("SUCCESS!!!")
