import { GraphQLObjectType, GraphQLList, GraphQLFloat, GraphQLInt, GraphQLString } from 'graphql'

import Mobike from '@multicycles/mobike'

import bicycleType from './bicycleType'
import logger from '../logger'

const mobike = new Mobike({ timeout: process.env.PROVIDER_TIMEOUT || 3000 })

const mobikeType = new GraphQLObjectType({
  name: 'Mobike',
  interfaces: [bicycleType],
  fields: {
    id: { type: GraphQLString },
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
    num: { type: GraphQLInt },
    distance: { type: GraphQLString },
    bikeIds: { type: GraphQLString },
    biketype: { type: GraphQLInt },
    type: { type: GraphQLInt },
    boundary: { type: GraphQLString }
  }
})

const getBicyclesByLatLng = {
  type: new GraphQLList(mobikeType),
  async resolve({ lat, lng }, args, context, info) {
    try {
      const result = await mobike.getBicyclesByLatLng({ lat, lng })

      return result.body.object.map(bike => ({
        id: bike.distId,
        lat: bike.distY,
        lng: bike.distX,
        num: bike.distNum,
        distance: bike.distance,
        bikeIds: bike.bikeIds,
        biketype: bike.biketype,
        type: bike.type,
        boundary: bike.boundary
      }))
    } catch (e) {
      logger.exception(e, {
        tags: { provider: 'mobike' },
        extra: {
          path: info.path,
          variable: info.variableValues,
          body: context.req.body
        }
      })

      return []
    }
  }
}

export default {
  getBicyclesByLatLng
}
