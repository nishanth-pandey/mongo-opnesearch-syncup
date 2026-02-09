import AWS from "aws-sdk";

const sqs = new AWS.SQS({ region: 'eu-west-2' }); // Adjust region as needed

async function setupQueues() {
  console.log("🔧 Setting up SQS queues for realtime sync...");

  const queueName = "mongo-opensearch-changes";
  const dlqName = "mongo-opensearch-changes-dlq";

  try {
    // Create Dead Letter Queue first
    console.log("Creating Dead Letter Queue...");
    const dlqParams = {
      QueueName: dlqName,
      Attributes: {
        MessageRetentionPeriod: "1209600", // 14 days
        VisibilityTimeout: "60"
      }
    };

    const dlqResult = await sqs.createQueue(dlqParams).promise();
    const dlqUrl = dlqResult.QueueUrl;
    console.log(`✅ DLQ created: ${dlqUrl}`);

    // Get DLQ ARN for redrive policy
    const dlqAttributes = await sqs.getQueueAttributes({
      QueueUrl: dlqUrl,
      AttributeNames: ['QueueArn']
    }).promise();
    
    const dlqArn = dlqAttributes.Attributes.QueueArn;

    // Create main queue with DLQ configuration
    console.log("Creating main queue with DLQ configuration...");
    const mainQueueParams = {
      QueueName: queueName,
      Attributes: {
        VisibilityTimeout: "60",
        MessageRetentionPeriod: "1209600", // 14 days
        RedrivePolicy: JSON.stringify({
          deadLetterTargetArn: dlqArn,
          maxReceiveCount: "5"
        }),
        ReceiveMessageWaitTimeSeconds: "20" // Long polling
      }
    };

    const mainQueueResult = await sqs.createQueue(mainQueueParams).promise();
    const mainQueueUrl = mainQueueResult.QueueUrl;
    console.log(`✅ Main queue created: ${mainQueueUrl}`);

    // Set up queue policies for security
    const queuePolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: "sqs:SendMessage",
          Resource: dlqArn,
          Condition: {
            ArnEquals: {
              "aws:SourceArn": `arn:aws:sqs:eu-west-2:*:${queueName}`
            }
          }
        }
      ]
    };

    await sqs.setQueueAttributes({
      QueueUrl: dlqUrl,
      Attributes: {
        Policy: JSON.stringify(queuePolicy)
      }
    }).promise();

    console.log("✅ Queue policies configured");
    console.log("\n📋 Queue URLs for your .env file:");
    console.log(`SQS_QUEUE_URL=${mainQueueUrl}`);
    console.log(`SQS_DLQ_URL=${dlqUrl}`);

    return { mainQueueUrl, dlqUrl };

  } catch (error) {
    if (error.code === 'QueueAlreadyExists') {
      console.log("_queues already exist, retrieving URLs...");
      return await getExistingQueueUrls(queueName, dlqName);
    } else {
      console.error("❌ Error setting up queues:", error.message);
      throw error;
    }
  }
}

async function getExistingQueueUrls(queueName, dlqName) {
  const mainQueueUrl = (await sqs.getQueueUrl({ QueueName: queueName }).promise()).QueueUrl;
  const dlqUrl = (await sqs.getQueueUrl({ QueueName: dlqName }).promise()).QueueUrl;
  
  console.log(`✅ Found existing queues:`);
  console.log(`Main Queue: ${mainQueueUrl}`);
  console.log(`DLQ: ${dlqUrl}`);
  
  return { mainQueueUrl, dlqUrl };
}

async function monitorQueues() {
  const { mainQueueUrl, dlqUrl } = await getExistingQueueUrls("mongo-opensearch-changes", "mongo-opensearch-changes-dlq");
  
  console.log("\n📊 Queue Monitoring:");
  
  // Monitor main queue
  const mainAttrs = await sqs.getQueueAttributes({
    QueueUrl: mainQueueUrl,
    AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible', 'ApproximateNumberOfMessagesDelayed']
  }).promise();
  
  console.log(`Main Queue (${mainQueueUrl}):`);
  console.log(`  Visible messages: ${mainAttrs.Attributes.ApproximateNumberOfMessages}`);
  console.log(`  In-flight messages: ${mainAttrs.Attributes.ApproximateNumberOfMessagesNotVisible}`);
  console.log(`  Delayed messages: ${mainAttrs.Attributes.ApproximateNumberOfMessagesDelayed}`);
  
  // Monitor DLQ
  const dlqAttrs = await sqs.getQueueAttributes({
    QueueUrl: dlqUrl,
    AttributeNames: ['ApproximateNumberOfMessages']
  }).promise();
  
  console.log(`DLQ (${dlqUrl}):`);
  console.log(`  Messages: ${dlqAttrs.Attributes.ApproximateNumberOfMessages}`);
}

// CLI interface
const action = process.argv[2];

if (action === 'setup') {
  setupQueues().catch(console.error);
} else if (action === 'monitor') {
  monitorQueues().catch(console.error);
} else {
  console.log("Usage:");
  console.log("node sqs-setup.js setup    - Create/configure queues");
  console.log("node sqs-setup.js monitor  - Monitor queue status");
}