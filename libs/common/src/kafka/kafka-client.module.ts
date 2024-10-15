import { ConsumerService } from '@app/common/kafka/consumer.service';
import { ProducerService } from '@app/common/kafka/producer.service';
import { Module } from '@nestjs/common';

@Module({
	providers: [ProducerService, ConsumerService],
	exports: [ProducerService, ConsumerService]
})
export class KafkaClientModule {}
