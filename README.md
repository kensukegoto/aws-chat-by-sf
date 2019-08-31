# API Gatewayのstageとは

- APIGatewayから叩くLambda関数を変更出来る。
- 次リリースバージョンのLambdaを試すなど。
- ステージの名前は自由。よくあるのはdev、prodだがbetaやstagingなど作る事が出来る。

# CloudFormationのFn::GetAtt

Fn::GetAtt関数は２つのパラメーターを取る。

```yml
      Resource:
        - Fn::GetAtt: [ ChatConnectionsTable, Arn ]
```

１つはリソースの論理名、もう１つは取得する属性の名前。上記例では`ChatConnectionsTable`の`Arn`を取得する指定をいている。

# environmentで渡すもの

```yml
  environment:
    TABLE_NAME:
      Ref: ChatConnectionsTable
```
Lambda関数内で`process.env.TABLE_NAME`と使用可能になる。<br>
上記では`ChatConnectionsTable`の`TableName`が取得出来る。

```yml
    ChatConnectionsTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service.name}-connections-${self:provider.stage}
        AttributeDefinitions:
          - AttributeName: connectionId
            AttributeType: S
            ~ 略 ~
```

# DynamoのKeySchema

DynamoDBテーブルはスキーマレスであるためテーブル作成時に属性やデータ型を定義する必要は無い。

# DynamoのProvisionedThroughput

このテーブルに必要な１秒あたりの読み取り・書き込み数。UpdateTableアクションを使用して、必要に応じて後で変更出来る。課金方法はProvisionedThroughputとOnDemandがあり、ここではProvisionedThroughputを指定している。

```yml
        ProvisionedThroughput:
          ReadCapacityUnits: 5
          WriteCapacityUnits: 5
```

# exportとmodule.exports

exports = module.exportsと読み替えてOK。おそらくexportのみしか昔は無かったがそれでは不都合が生じたため後からmodule.exportsが出現した。

# ユーザーから送られたメッセージは何処かにプールされるか？（デバッグしたい）

lambdaの各関数をCloudWatchで監視する。<br>
WSを使ってAPIGatewayに送られてくるメッセージの監視はサポートしていない様子。<br>

https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/apigateway-websocket-api-logging.html
