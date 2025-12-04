// lib/insights/ExampleMatcher.ts
// Vector similarity search voor customer examples

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type { CustomerExample, MatchOptions } from './types';
import type { ChapterKey } from '@/types/project';

export class ExampleMatcher {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  /**
   * Find similar customer examples via vector similarity
   */
  async findSimilar(
    query: string,
    options: MatchOptions = {}
  ): Promise<CustomerExample[]> {
    const {
      limit = 10,
      minQualityScore = 0.7,
      tags,
      chapter
    } = options;

    // 1. Generate embedding for query
    const embedding = await this.getEmbedding(query);

    // 2. Call Supabase RPC function for vector search
    let rpcCall = this.supabase.rpc('match_customer_examples', {
      query_embedding: embedding,
      match_threshold: minQualityScore,
      match_count: limit * 2, // Fetch more, then filter
    });

    const { data, error } = await rpcCall;

    if (error) {
      console.error('ExampleMatcher error:', error);
      throw new Error(`Vector search failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // 3. Apply additional filters
    let filtered = data as CustomerExample[];

    if (tags && tags.length > 0) {
      filtered = filtered.filter(ex =>
        ex.tags.some(tag => tags.includes(tag))
      );
    }

    if (chapter) {
      filtered = filtered.filter(ex =>
        ex.interpretation?.chapter === chapter
      );
    }

    // 4. Return top results
    return filtered.slice(0, limit);
  }

  /**
   * Generate embedding via OpenAI
   */
  private async getEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  /**
   * Batch generate embeddings voor bestaande examples zonder embedding
   * Run dit eenmalig als migratie
   */
  async generateMissingEmbeddings(batchSize = 50): Promise<number> {
    console.log('🔄 Fetching examples without embeddings...');

    const { data: examples, error } = await this.supabase
      .from('customer_examples')
      .select('id, userQuery')
      .is('embedding', null)
      .limit(batchSize);

    if (error) {
      console.error('Fetch error:', error);
      throw error;
    }

    if (!examples || examples.length === 0) {
      console.log('✅ No more examples need embeddings!');
      return 0;
    }

    console.log(`📊 Generating embeddings for ${examples.length} examples...`);

    let successCount = 0;

    for (const example of examples) {
      try {
        const embedding = await this.getEmbedding(example.userQuery);

        const { error: updateError } = await this.supabase
          .from('customer_examples')
          .update({ embedding })
          .eq('id', example.id);

        if (updateError) {
          console.error(`✗ Update failed for ${example.id}:`, updateError);
        } else {
          successCount++;
          console.log(`✓ ${successCount}/${examples.length} - ${example.id}`);
        }

        // Rate limiting: 60ms delay (max ~1000 req/min for tier 1)
        await new Promise(resolve => setTimeout(resolve, 60));
      } catch (err) {
        console.error(`✗ Failed for ${example.id}:`, err);
      }
    }

    console.log(`✅ Batch complete. ${successCount}/${examples.length} embeddings generated.`);
    return successCount;
  }

  /**
   * Get total count of examples without embeddings
   */
  async countMissingEmbeddings(): Promise<number> {
    const { count, error } = await this.supabase
      .from('customer_examples')
      .select('*', { count: 'exact', head: true })
      .is('embedding', null);

    if (error) throw error;
    return count || 0;
  }
}
