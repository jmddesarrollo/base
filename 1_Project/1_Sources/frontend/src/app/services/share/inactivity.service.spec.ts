import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InactivityService } from './inactivity.service';
import { environment } from '../../../environments/environment';

describe('Propiedad 5 - El servicio de inactividad reinicia el timer ante cualquier interacción', () => {
  let service: InactivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InactivityService]
    });
    service = TestBed.inject(InactivityService);
  });

  afterEach(() => {
    service.stopWatching();
  });

  it('startWatching debe registrar listeners de eventos', () => {
    const addEventListenerSpy = jasmine.createSpy('addEventListener');
    const originalAddEventListener = document.addEventListener;
    (document as any).addEventListener = addEventListenerSpy;

    service.startWatching();

    expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', jasmine.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', jasmine.any(Function));

    (document as any).addEventListener = originalAddEventListener;
    service.stopWatching();
  });

  it('click debe reiniciar el timer de logout', fakeAsync(() => {
    const logoutSpy = jasmine.createSpy('logout');
    service.logout$.subscribe(logoutSpy);

    service.startWatching();

    const timeoutMs = environment.inactivityTimeoutMinutes * 60 * 1000;

    tick(timeoutMs - 1000);

    document.dispatchEvent(new Event('click'));
    tick(1000);

    expect(logoutSpy).not.toHaveBeenCalled();

    tick(timeoutMs);

    expect(logoutSpy).toHaveBeenCalled();
  }));

  it('keydown debe reiniciar el timer de logout', fakeAsync(() => {
    const logoutSpy = jasmine.createSpy('logout');
    service.logout$.subscribe(logoutSpy);

    service.startWatching();

    const timeoutMs = environment.inactivityTimeoutMinutes * 60 * 1000;

    tick(timeoutMs - 1000);

    document.dispatchEvent(new KeyboardEvent('keydown'));
    tick(1000);

    expect(logoutSpy).not.toHaveBeenCalled();

    tick(timeoutMs);

    expect(logoutSpy).toHaveBeenCalled();
  }));

  it('mousemove debe reiniciar el timer de logout', fakeAsync(() => {
    const logoutSpy = jasmine.createSpy('logout');
    service.logout$.subscribe(logoutSpy);

    service.startWatching();

    const timeoutMs = environment.inactivityTimeoutMinutes * 60 * 1000;

    tick(timeoutMs - 1000);

    document.dispatchEvent(new Event('mousemove'));
    tick(1000);

    expect(logoutSpy).not.toHaveBeenCalled();

    tick(timeoutMs);

    expect(logoutSpy).toHaveBeenCalled();
  }));

  it('stopWatching debe dejar de detectar interacciones', fakeAsync(() => {
    const logoutSpy = jasmine.createSpy('logout');
    service.logout$.subscribe(logoutSpy);

    service.startWatching();
    service.stopWatching();

    const timeoutMs = environment.inactivityTimeoutMinutes * 60 * 1000;
    tick(timeoutMs);

    expect(logoutSpy).not.toHaveBeenCalled();
  }));
});

describe('Propiedad 6 - El timeout de inactividad siempre dispara el logout', () => {
  let service: InactivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InactivityService]
    });
    service = TestBed.inject(InactivityService);
  });

  afterEach(() => {
    service.stopWatching();
  });

  it('logout se emite exactamente cuando expire el timeout', fakeAsync(() => {
    const logoutSpy = jasmine.createSpy('logout');
    service.logout$.subscribe(logoutSpy);

    service.startWatching();

    const timeoutMs = environment.inactivityTimeoutMinutes * 60 * 1000;

    tick(timeoutMs - 1);
    expect(logoutSpy).not.toHaveBeenCalled();

    tick(1);
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  }));

  it('warning se emite 2 minutos antes del logout', fakeAsync(() => {
    const warningSpy = jasmine.createSpy('warning');
    service.warning$.subscribe(warningSpy);

    service.startWatching();

    const timeoutMs = environment.inactivityTimeoutMinutes * 60 * 1000;
    const warningMs = timeoutMs - (2 * 60 * 1000);

    tick(warningMs - 1);
    expect(warningSpy).not.toHaveBeenCalled();

    tick(1);
    expect(warningSpy).toHaveBeenCalledTimes(1);
  }));

  it('sin interacción, el logout se ejecuta exactamente una vez', fakeAsync(() => {
    const logoutSpy = jasmine.createSpy('logout');
    service.logout$.subscribe(logoutSpy);

    service.startWatching();

    const timeoutMs = environment.inactivityTimeoutMinutes * 60 * 1000;

    tick(timeoutMs + 1000);

    expect(logoutSpy).toHaveBeenCalledTimes(1);
  }));

  it('múltiples interacciones no afectan el timeout final', fakeAsync(() => {
    const logoutSpy = jasmine.createSpy('logout');
    const warningSpy = jasmine.createSpy('warning');
    service.logout$.subscribe(logoutSpy);
    service.warning$.subscribe(warningSpy);

    service.startWatching();

    const timeoutMs = environment.inactivityTimeoutMinutes * 60 * 1000;

    for (let i = 0; i < 10; i++) {
      tick(timeoutMs / 3);
      document.dispatchEvent(new Event('click'));
    }

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(logoutSpy).not.toHaveBeenCalled();

    tick(timeoutMs);

    expect(logoutSpy).toHaveBeenCalledTimes(1);
  }));
});