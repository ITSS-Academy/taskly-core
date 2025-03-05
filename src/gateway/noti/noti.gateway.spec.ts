import { Test, TestingModule } from '@nestjs/testing';
import { NotiGateway } from './noti.gateway';

describe('NotiGateway', () => {
  let gateway: NotiGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotiGateway],
    }).compile();

    gateway = module.get<NotiGateway>(NotiGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
