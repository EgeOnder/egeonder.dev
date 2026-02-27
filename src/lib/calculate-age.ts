export function calculateAge(): number {
  const birthDate = new Date("2003-08-19");
  const today = new Date();
  return today.getFullYear() - birthDate.getFullYear() - (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
}
