import { create } from 'zustand';

const usePOSStore = create((set, get) => ({
  // Cart items
  cart: [],
  
  // Customer info
  customer: {
    type: 'walk-in', // walk-in or registered
    name: '',
    phone: '',
    id: null,
    address: ''
  },
  
  // Discounts
  discount: {
    type: 'flat', // flat or percentage
    value: 0
  },
  
  // Tax rate (GST) - Now calculated per item
  taxRate: 18, // 18% GST (legacy, kept for backward compatibility)
  
  // Add item to cart
  addToCart: (product) => {
    console.log('\n=== ADD TO CART DEBUG ===');
    console.log('Product received:', product);
    console.log('product.id:', product.id, '| type:', typeof product.id);
    console.log('product.price:', product.price, '| type:', typeof product.price);
    
    return set((state) => {
      console.log('Current cart before update:', state.cart.map(i => ({ id: i.id, name: i.name, price: i.price })));
      
      const existingItem = state.cart.find(item => {
        const match = item.id === product.id;
        if (match) {
          console.log(`✓ Found existing item: "${item.name}" matches "${product.name}"`);
        }
        return match;
      });
      
      if (existingItem) {
        console.log('Updating existing item quantity');
        return {
          cart: state.cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      
      console.log('Adding as NEW item');
      
      // Create new cart item explicitly
      const newItem = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        mrp: Number(product.mrp) || 0,
        sku: product.sku || '',
        category: product.category || '',
        brand: product.brand || '',
        stock: Number(product.stock) || 0,
        image: product.image || '',
        costPrice: Number(product.costPrice) || 0,
        quantity: 1,
        taxRate: Number(product.gstRate) || 18, // Store the product's tax rate
      };
      
      console.log('New item created:', newItem);
      console.log('newItem.id:', newItem.id);
      console.log('newItem.price:', newItem.price);
      
      const newCart = [...state.cart, newItem];
      console.log('New cart state:', newCart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity })));
      
      return { cart: newCart };
    });
  },
  
  // Remove item from cart
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== productId)
  })),
  
  // Update item quantity
  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return {
        cart: state.cart.filter(item => item.id !== productId)
      };
    }
    
    return {
      cart: state.cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    };
  }),
  
  // Increment quantity
  incrementQuantity: (productId) => set((state) => ({
    cart: state.cart.map(item =>
      item.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  })),
  
  // Decrement quantity
  decrementQuantity: (productId) => set((state) => ({
    cart: state.cart.map(item =>
      item.id === productId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ).filter(item => item.quantity > 0)
  })),
  
  // Set discount
  setDiscount: (type, value) => set({
    discount: { type, value }
  }),
  
  // Set customer
  setCustomer: (customer) => set({ customer }),
  
  // Clear cart
  clearCart: () => set({ 
    cart: [],
    discount: { type: 'flat', value: 0 },
    customer: { type: 'walk-in', name: '', phone: '', id: null, address: '' }
  }),
  
  // Calculate subtotal
  getSubtotal: () => {
    const state = get();
    return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  // Calculate discount amount
  getDiscountAmount: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    
    if (state.discount.type === 'percentage') {
      return (subtotal * state.discount.value) / 100;
    }
    
    return state.discount.value;
  },
  
  // Calculate tax amount (per item based on their tax rates)
  getTaxAmount: () => {
    const state = get();
    const discountAmount = state.getDiscountAmount();
    const subtotal = state.getSubtotal();
    
    // If no discount, calculate tax per item
    if (discountAmount === 0) {
      return state.cart.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const itemTax = (itemTotal * item.taxRate) / 100;
        return sum + itemTax;
      }, 0);
    }
    
    // With discount, calculate proportional tax for each item
    const discountRatio = discountAmount / subtotal;
    return state.cart.reduce((sum, item) => {
      const itemSubtotal = item.price * item.quantity;
      const itemDiscount = itemSubtotal * discountRatio;
      const itemTaxable = itemSubtotal - itemDiscount;
      const itemTax = (itemTaxable * item.taxRate) / 100;
      return sum + itemTax;
    }, 0);
  },
  
  // Calculate tax breakdown by rate
  getTaxBreakdown: () => {
    const state = get();
    const discountAmount = state.getDiscountAmount();
    const subtotal = state.getSubtotal();
    const discountRatio = subtotal > 0 ? discountAmount / subtotal : 0;
    
    const taxByRate = {};
    
    state.cart.forEach(item => {
      const rate = item.taxRate || 18;
      const itemSubtotal = item.price * item.quantity;
      const itemDiscount = itemSubtotal * discountRatio;
      const itemTaxable = itemSubtotal - itemDiscount;
      const itemTax = (itemTaxable * rate) / 100;
      
      if (!taxByRate[rate]) {
        taxByRate[rate] = 0;
      }
      taxByRate[rate] += itemTax;
    });
    
    return taxByRate;
  },
  
  // Calculate total
  getTotal: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    const discountAmount = state.getDiscountAmount();
    const taxAmount = state.getTaxAmount();
    
    return subtotal - discountAmount + taxAmount;
  }
}));

export default usePOSStore;
