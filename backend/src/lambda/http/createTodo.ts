import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Implement creating a new TODO item
    const userId: string = getUserId(event)
    const createTodoRequest: CreateTodoRequest = JSON.parse(event.body)
    let response: APIGatewayProxyResult | PromiseLike<APIGatewayProxyResult>

    try {
      const createdTodo = await createTodo(userId, createTodoRequest)

      response = {
        statusCode: 201,
        body: JSON.stringify({
          item: createdTodo
        })
      }
    } catch (e) {
      logger.error(`Error creating Todo item: ${e.message}`)

      response = {
        statusCode: 500,
        body: JSON.stringify({
          error: e.message
        })
      }
    }

    return response
  }
)

handler.use(
  cors({
    origin: '*',
    credentials: true
  })
)
