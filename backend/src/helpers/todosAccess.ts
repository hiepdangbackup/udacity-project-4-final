import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWSClient(new AWS.DynamoDB())
// const logger = createLogger('todosAccess');
// const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the dataLayer logic
export class TodosAccess {
  private readonly docClient: DocumentClient
  private readonly todosTable: string

  constructor() {
    this.docClient = new AWS.DynamoDB.DocumentClient({ service: XAWS })
    this.todosTable = process.env.TODOS_TABLE
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items

    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem,
        ReturnValues: 'NONE'
      })
      .promise()

    return todoItem
  }

  async updateTodo(
    userId: string,
    todoId: string,
    updateData: TodoUpdate
  ): Promise<TodoItem> {
    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: {
          ':name': updateData.name,
          ':dueDate': updateData.dueDate,
          ':done': updateData.done
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()

    const updatedTodo = result.Attributes

    return updatedTodo as TodoItem
  }

  async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId, todoId },
        ReturnValues: 'ALL_OLD'
      })
      .promise()

    const deletedTodo = result.Attributes

    return deletedTodo as TodoItem
  }

  async updateTodoAttachmentUrl(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ): Promise<TodoItem> {
    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()

    const updatedTodo = result.Attributes

    return updatedTodo as TodoItem
  }

  async isExistedTodo(userId: string, todoId: string): Promise<boolean> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise()
    return result.Item !== null && result.Item !== undefined
  }
}
