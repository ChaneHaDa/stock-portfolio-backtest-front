describe('Simple test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })
  
  it('should test string functions', () => {
    expect('hello'.toUpperCase()).toBe('HELLO')
  })
})