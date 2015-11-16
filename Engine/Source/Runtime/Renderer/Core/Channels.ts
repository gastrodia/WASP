class Channels{
  mask = 1;
  set( channel ) {

		this.mask = 1 << channel;

	}

	enable( channel ) {

		this.mask |= 1 << channel;

	}

	toggle( channel ) {

		this.mask ^= 1 << channel;

	}

	disable ( channel ) {

		this.mask &= ~ ( 1 << channel );

	}

}

export = Channels;
