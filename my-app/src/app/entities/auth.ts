// trieda Auth - asi na uloženie prihlasovacích údajov
export class Auth {
  constructor(
    public name: string = '', // meno užívateľa - na začiatku je prázdne
    public password: string = '' // heslo - na začiatku je prázdne
  ){}
}