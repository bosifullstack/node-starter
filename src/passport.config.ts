import passport from 'passport';
import passportLocal from 'passport-local';
import passportJwt from 'passport-jwt';

import { User, IUser } from './models/user';

passport.serializeUser((user: Partial<IUser>, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e, null);
  }
});

const LocalStrategy = passportLocal.Strategy;
const localStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findByUserName(username);

    if (user && User.validatePassword(user, password)) {
      return done(null, user);
    } else if (user) {
      return done(null, false, { message: 'Incorrect password.' });
    } else {
      return done(null, false, { message: 'Incorrect username.' });
    }
  } catch (e) {
    return done(e);
  }
});

passport.use('login', localStrategy);

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

export const tokenOps = {
  expiresIn: '2 days',
  issuer: 'bosibackend',
  audience: 'yoursite.net',
};

const opts = {
  jwtFromRequest: ExtractJwt.fromHeader('x-access-token'),
  secretOrKey: 'secret',
  ...tokenOps,
};

const jwtStrategy = new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.sub);

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (e) {
    done(e, false);
  }
});

passport.use('token', jwtStrategy);
