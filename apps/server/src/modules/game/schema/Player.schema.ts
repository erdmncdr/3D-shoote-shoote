import { Schema, type } from '@colyseus/schema';

export class Vector3Schema extends Schema {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') z: number = 0;

  constructor(x = 0, y = 0, z = 0) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

export class PlayerSchema extends Schema {
  @type('string') id: string;
  @type('string') username: string;
  @type('string') team: string; // 'blue' or 'red'

  @type(Vector3Schema) position = new Vector3Schema(0, 1.6, 0);
  @type(Vector3Schema) rotation = new Vector3Schema(0, 0, 0);
  @type(Vector3Schema) velocity = new Vector3Schema(0, 0, 0);

  @type('number') health: number = 100;
  @type('number') armor: number = 100;
  @type('boolean') isAlive: boolean = true;

  @type('string') currentWeapon: string = 'assault_rifle';
  @type('number') ammo: number = 30;
  @type('number') reserveAmmo: number = 90;

  @type('number') kills: number = 0;
  @type('number') deaths: number = 0;
  @type('number') assists: number = 0;

  constructor(id: string, username: string, team: string) {
    super();
    this.id = id;
    this.username = username;
    this.team = team;
  }
}
