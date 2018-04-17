describe("LRN namespace", function() {
	
	it("is to have the Lrn object", function(){
	    expect(Lrn).toBeDefined();
	    expect(Lrn).not.toBeNull();
	});
  
	it("expects jQuery",function(){
		expect(jQuery).toBeDefined();
		expect(jQuery.cookie).toBeDefined();
	});
	
});