/**
 * Test search functionality across all content types
 */

import { searchContent, getSearchSuggestions } from '../src/lib/search/query'

async function main() {
  console.log('🔍 Testing search functionality...\n')

  // Test 1: Search all content types
  console.log('Test 1: Searching for "API" across all content types')
  const result1 = await searchContent('API', {
    limit: 5,
    types: ['document', 'blog', 'api-spec', 'feature'],
  })
  console.log(`Found ${result1.total} results:`)
  result1.results.forEach((r) => {
    console.log(`  - [${r.type}] ${r.title} (rank: ${r.rank.toFixed(3)})`)
  })

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 2: Search only feature requests
  console.log('Test 2: Searching for "feature" in feature requests only')
  const result2 = await searchContent('feature', {
    limit: 3,
    types: ['feature'],
  })
  console.log(`Found ${result2.total} results:`)
  result2.results.forEach((r) => {
    console.log(`  - ${r.title}`)
    if (r.highlight) console.log(`    "${r.highlight}"`)
  })

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 3: Search suggestions
  console.log('Test 3: Getting search suggestions for "doc"')
  const suggestions = await getSearchSuggestions('doc', 5)
  console.log(`Suggestions: ${suggestions.join(', ')}`)

  console.log('\n✅ Search tests complete!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
