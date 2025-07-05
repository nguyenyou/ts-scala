// Basic interfaces
interface Person {
  name: string;
  age: number;
  email?: string;
}

// Type aliases
type UserId = string;

// Interface with inheritance
interface User extends Person {
  id: UserId;
  roles: string[];
}
