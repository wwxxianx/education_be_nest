import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class Supabase {
  private client: SupabaseClient;

  constructor(private config: ConfigService) {}

  getClient() {
    if (this.client) {
      return this.client;
    }
    this.client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
    return this.client;
  }
}
