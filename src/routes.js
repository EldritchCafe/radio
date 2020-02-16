import Route from 'route-parser'

export const home = new Route('/')
export const share = new Route('/share/:domain/:id')