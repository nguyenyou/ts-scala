export function hello(): void {
  console.log('Hello tsdown!')
}


export function sum(a: number, b: number): number {
  return a + b
}

type User = {
  name: string
  age: number
}

export function getUser(name: string): User {
  return { name, age: 20 }
}