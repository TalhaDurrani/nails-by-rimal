// Quick test to verify categories in database
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testCategories() {
  console.log('🔍 Testing category connectivity...')
  
  try {
    // Test 1: Get all categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('id')
    
    if (catError) {
      console.error('❌ Categories error:', catError)
      return
    }
    
    console.log('✅ Categories found:', categories?.length || 0)
    categories?.forEach(cat => {
      console.log(`   ${cat.id}. ${cat.name} (parent: ${cat.parent_id || 'none'})`)
    })
    
    // Test 2: Get products for category 3 (Gift Sets)
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('product_id, title, category_id')
      .eq('category_id', 3)
    
    if (prodError) {
      console.error('❌ Products error:', prodError)
      return
    }
    
    console.log(`\n✅ Products in category 3 (Gift Sets): ${products?.length || 0}`)
    products?.forEach(prod => {
      console.log(`   - ${prod.title}`)
    })
    
    // Test 3: Get products for category 1 (Press-On Nails)
    const { data: products1, error: prod1Error } = await supabase
      .from('products')
      .select('product_id, title, category_id')
      .eq('category_id', 1)
    
    if (prod1Error) {
      console.error('❌ Products category 1 error:', prod1Error)
      return
    }
    
    console.log(`\n✅ Products in category 1 (Press-On Nails): ${products1?.length || 0}`)
    products1?.forEach(prod => {
      console.log(`   - ${prod.title}`)
    })
    
  } catch (error) {
    console.error('❌ Connection error:', error.message)
  }
}

testCategories()