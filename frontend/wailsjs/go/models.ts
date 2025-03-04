export namespace main {
	
	export class TzResponse {
	    tz_name: string;
	    tz_code: string;
	
	    static createFrom(source: any = {}) {
	        return new TzResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tz_name = source["tz_name"];
	        this.tz_code = source["tz_code"];
	    }
	}

}

